from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render, get_object_or_404
from datetime import date
from .models import Prescription, PrescriptionItem
from .serializers import PrescriptionSerializer, PrescriptionItemSerializer


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]


class PrescriptionItemViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionItem.objects.all()
    serializer_class = PrescriptionItemSerializer
    permission_classes = [IsAuthenticated]


def generate_pdf(request, pk):
    prescription = get_object_or_404(Prescription, pk=pk)
    dob = prescription.patient.date_of_birth
    today = date.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return render(request, 'prescriptions/prescription_print.html', {
        'prescription': prescription,
        'patient_age': age,
    })