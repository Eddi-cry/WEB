from django.urls import path
from .views import DownloadArchiveView, StationFilesView



urlpatterns = [
    path('download/', DownloadArchiveView.as_view(), name='download-files'), 
    path('stations/', StationFilesView.as_view(), name='station-files'),
     # Исправлено!
]