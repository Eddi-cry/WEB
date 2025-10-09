from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from datetime import datetime
import os
import tarfile
from django.conf import settings
from .models import File, Station
import uuid
import tempfile
from .serializer import FileSerializer, StationSerializer

import paramiko
import traceback


class StationFilesView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        stations = request.data.get('stations', [])
        start_date_str = request.data.get('startDate')
        end_date_str = request.data.get('endDate')

        if not stations:
            return Response(
                {"error": "Не выбраны станции"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not start_date_str or not end_date_str:
            return Response(
                {"error": "Укажите начальную и конечную даты"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()

            result = {}
            for station_name in stations:
                try:
                    stations_qs = Station.objects.filter(staname__iexact=station_name)

                    if not stations_qs.exists():
                        result[station_name] = {"error": f"Станция '{station_name}' не найдена"}
                        continue

                    station_files = []
                    for station in stations_qs:
                        files = File.objects.filter(
                            staid=station.staid,
                            date__gte=start_date,
                            date__lte=end_date
                        ).select_related('staid')

                        serializer = FileSerializer(files, many=True)
                        station_files.extend(serializer.data)

                    result[station_name] = station_files if station_files else []

                except Exception as e:
                    result[station_name] = {"error": f"Ошибка при обработке станции: {str(e)}"}

            return Response(result, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response(
                {"error": f"Неверный формат даты. Используйте YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"Серверная ошибка: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Настройки SSH
SSH_HOST = "172.20.1.177"
SSH_PORT = 22
SSH_USERNAME = "volichevm"
SSH_PASSWORD = "DVnm34_E$T"

# Путь к данным на удалённом сервере
REMOTE_BASE_PATH = "/home/volichevm/"


class DownloadArchiveView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        stations = request.data.get('stations', [])
        start_date_str = request.data.get('startDate')
        end_date_str = request.data.get('endDate')

        if not stations:
            return Response({"error": "Не выбраны станции"}, status=status.HTTP_400_BAD_REQUEST)

        if not start_date_str or not end_date_str:
            return Response({"error": "Укажите начальную и конечную даты"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()

            if start_date > end_date:
                return Response(
                    {"error": "Дата начала не может быть позже даты окончания"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(SSH_HOST, port=SSH_PORT, username=SSH_USERNAME, password=SSH_PASSWORD)
            sftp = ssh.open_sftp()

            with tempfile.TemporaryDirectory() as tmp_dir:
                tar_filename = f'gnss_data_{start_date}_{end_date}_{uuid.uuid4().hex[:6]}.tar.gz'
                tar_path = os.path.join(settings.MEDIA_ROOT, tar_filename)

                with tarfile.open(tar_path, 'w:gz') as tar:
                    file_count = 0

                    for station_name in stations:
                        stations_qs = Station.objects.filter(staname__iexact=station_name)
                        if not stations_qs.exists():
                            continue

                        for station in stations_qs:
                            files = File.objects.filter(
                                staid=station.staid,
                                date__gte=start_date,
                                date__lte=end_date
                            ).select_related('staid')

                            for file in files:
                                remote_path = os.path.join(
                                    file.path,
                                    file.filename
                                )

                                print(f"🔍 Проверка: {remote_path}")
                                local_file_path = os.path.join(tmp_dir, f"{station.staname}_{file.date}_{file.filename}")

                                try:
                                    sftp.stat(remote_path)
                                    sftp.get(remote_path, local_file_path)

                                    if os.path.exists(local_file_path):
                                        arcname = os.path.join(
                                            file.staid.staname.upper(),
                                            file.date.strftime('%Y-%m-%d'),
                                            file.filename
                                        )
                                        tar.add(local_file_path, arcname=arcname)
                                        file_count += 1
                                        print(f"✅ Добавлен: {arcname}")
                                    else:
                                        print(f"❌ Локальный файл не создан: {local_file_path}")

                                except FileNotFoundError:
                                    print(f"❌ Файл не найден: {remote_path}")
                                except Exception as e:
                                    print(f"❌ Ошибка при скачивании {remote_path}: {str(e)}")

                    # ✅ Явно закрываем архив
                    tar.close()

                # ✅ Закрываем sftp и ssh
                sftp.close()
                ssh.close()

                if file_count == 0:
                    os.remove(tar_path)
                    return Response(
                        {'error': 'Файлы не найдены или не удалось скопировать'},
                        status=status.HTTP_404_NOT_FOUND
                    )

                # ✅ Возвращаем только JSON, без Content-Disposition
                return Response({
                    'success': True,
                    'download_url': request.build_absolute_uri(f"/media/{tar_filename}"),
                    'file_count': file_count,
                    'archive_name': tar_filename,
                    'stations': stations,
                    'period': f"{start_date} - {end_date}",
                }, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": f"Ошибка: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
