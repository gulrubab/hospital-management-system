from django.db import models

class Doctor(models.Model):
    SPECIALIZATION_CHOICES = [
        ('Cardiology', 'Cardiology'),
        ('Dermatology', 'Dermatology'),
        ('Pediatrics', 'Pediatrics'),
        ('Orthopedics', 'Orthopedics'),
        ('Neurology', 'Neurology'),
        ('Gynecology', 'Gynecology'),
        ('Ophthalmology', 'Ophthalmology'),
        ('ENT', 'Ear, Nose & Throat'),
        ('Psychiatry', 'Psychiatry'),
        ('Radiology', 'Radiology'),
    ]
    
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)  # Back to original
    phone = models.CharField(max_length=15)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    qualification = models.CharField(max_length=200)
    father_name = models.CharField(max_length=200, blank=True, null=True)
    cnic = models.CharField(max_length=15, blank=True, null=True)
    experience_years = models.IntegerField()
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    available_days = models.CharField(max_length=100, help_text="e.g., Mon, Tue, Wed")
    available_time_start = models.TimeField()
    available_time_end = models.TimeField()
    profile_picture = models.ImageField(upload_to='doctors/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Dr. {self.name} - {self.specialization}"
