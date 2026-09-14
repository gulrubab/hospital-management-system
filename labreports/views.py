from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import LabReport
from .serializers import LabReportSerializer


class LabReportViewSet(viewsets.ModelViewSet):
    queryset = LabReport.objects.all()
    serializer_class = LabReportSerializer
    permission_classes = [IsAuthenticated]
