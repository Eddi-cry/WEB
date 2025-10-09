from rest_framework import serializers
from .models import Station, File


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = [
            'staid', 'staname', 'longstaname', 'network', 'agency', 
            'country', 'receiver', 'recvers', 'recnum', 'antenna', 
            'antnum', 'deltan', 'deltae', 'deltah', 'startdate', 
            'enddate', 'sta_daterange'
        ]
        read_only_fields = ['staid']  # Если staid автоинкрементное или неизменяемое

class FileSerializer(serializers.ModelSerializer):
    staid_info = serializers.SerializerMethodField(read_only=True, required=False)
    date = serializers.DateField(format='%Y-%m-%d')

    class Meta:
        model = File
        fields = [
            'id', 'filename', 'date', 'period',
            'filetype', 'path', 'staid_info','fullness'
        ]
    
    def get_staid_info(self, obj):
        if not obj.staid:
            return None
        return {
            'staid': obj.staid.staid,
            'staname': obj.staid.staname
        }