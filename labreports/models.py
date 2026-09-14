from django.db import models
from patients.models import Patient
from doctors.models import Doctor


class LabReport(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='lab_reports')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='lab_reports')
    test_name = models.CharField(max_length=200)
    result_summary = models.TextField(blank=True)
    result_file = models.FileField(upload_to='lab_reports/', null=True, blank=True)
    test_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.test_name} - {self.patient}"
