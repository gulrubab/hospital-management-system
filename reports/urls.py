from django.urls import path
from . import views

urlpatterns = [
    path('patients/', views.generate_patient_report, name='patient-report'),
    path('revenue/', views.generate_revenue_report, name='revenue-report'),
    path('appointments/', views.generate_appointment_report, name='appointment-report'),
    path('patients/<int:patient_id>/', views.generate_single_patient_report, name='single-patient-report'),
]
