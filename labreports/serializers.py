from rest_framework import serializers
from .models import LabReport


class LabReportSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = LabReport
        fields = '__all__'

    def get_doctor_name(self, obj):
        if obj.doctor:
            if hasattr(obj.doctor, 'name') and obj.doctor.name:
                return obj.doctor.name
            if hasattr(obj.doctor, 'first_name'):
                return f"{obj.doctor.first_name} {obj.doctor.last_name or ''}"
        return "Unknown"

    def get_patient_name(self, obj):
        if obj.patient:
            return f"{obj.patient.first_name} {obj.patient.last_name}"
        return "Unknown"
