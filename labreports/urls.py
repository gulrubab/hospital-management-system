from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LabReportViewSet

router = DefaultRouter()
router.register(r'lab-reports', LabReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
