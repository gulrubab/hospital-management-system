from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from patients.models import Patient
from appointments.models import Appointment
from billing.models import Billing
from doctors.models import Doctor
from datetime import datetime


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_patient_report(request):
    """Generate PDF report of all patients"""
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="patient_report.pdf"'
    
    doc = SimpleDocTemplate(response, pagesize=landscape(A4))
    styles = getSampleStyleSheet()
    elements = []
    
    # Title
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=24, spaceAfter=30, alignment=1)
    elements.append(Paragraph("Hospital Management System", title_style))
    elements.append(Paragraph("Patient Report", styles['Heading2']))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Table data
    patients = Patient.objects.all()
    
    if patients.exists():
        data = [['ID', 'Full Name', 'Email', 'Phone', 'Gender', 'Blood Group', 'Registration Date']]
        
        for patient in patients:
            # Handle different field name possibilities
            if hasattr(patient, 'first_name') and hasattr(patient, 'last_name'):
                full_name = f"{patient.first_name} {patient.last_name}"
            elif hasattr(patient, 'name'):
                full_name = patient.name
            else:
                full_name = f"Patient {patient.id}"
            
            data.append([
                str(patient.id),
                full_name,
                patient.email,
                patient.phone,
                patient.gender if hasattr(patient, 'gender') else '-',
                patient.blood_group if hasattr(patient, 'blood_group') else '-',
                patient.created_at.strftime('%Y-%m-%d') if hasattr(patient, 'created_at') else datetime.now().strftime('%Y-%m-%d')
            ])
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
        ]))
        
        elements.append(table)
    else:
        elements.append(Paragraph("No patients found in the system.", styles['Normal']))
    
    # Footer
    elements.append(Spacer(1, 30))
    elements.append(Paragraph(f"Total Patients: {patients.count()}", styles['Normal']))
    
    doc.build(elements)
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_revenue_report(request):
    """Generate PDF report of revenue"""
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="revenue_report.pdf"'
    
    doc = SimpleDocTemplate(response, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []
    
    # Title
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=24, spaceAfter=30, alignment=1)
    elements.append(Paragraph("Hospital Management System", title_style))
    elements.append(Paragraph("Revenue Report", styles['Heading2']))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Get paid bills
    bills = Billing.objects.filter(status='Paid')
    total_revenue = sum(float(bill.total_amount) for bill in bills)
    
    if bills.exists():
        data = [['Bill #', 'Patient Name', 'Amount', 'Payment Method', 'Date Paid']]
        
        for bill in bills:
            # Handle patient name
            if hasattr(bill.patient, 'first_name') and hasattr(bill.patient, 'last_name'):
                patient_name = f"{bill.patient.first_name} {bill.patient.last_name}"
            elif hasattr(bill.patient, 'name'):
                patient_name = bill.patient.name
            else:
                patient_name = f"Patient {bill.patient.id}"
            
            data.append([
                bill.bill_number,
                patient_name,
                f"Rs{bill.total_amount}",
                bill.payment_method or 'Cash',
                bill.paid_at.strftime('%Y-%m-%d') if bill.paid_at else bill.created_at.strftime('%Y-%m-%d')
            ])
        
        # Add total row
        data.append(['', '', 'TOTAL:', f"Rs{total_revenue:.2f}", ''])
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ]))
        
        elements.append(table)
    else:
        elements.append(Paragraph("No paid bills found in the system.", styles['Normal']))
    
    # Summary
    elements.append(Spacer(1, 30))
    elements.append(Paragraph(f"Total Revenue: Rs{total_revenue:.2f}", styles['Heading4']))
    elements.append(Paragraph(f"Number of Paid Bills: {bills.count()}", styles['Normal']))
    
    doc.build(elements)
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_appointment_report(request):
    """Generate PDF report of appointments"""
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="appointment_report.pdf"'
    
    doc = SimpleDocTemplate(response, pagesize=landscape(A4))
    styles = getSampleStyleSheet()
    elements = []
    
    # Title
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=24, spaceAfter=30, alignment=1)
    elements.append(Paragraph("Hospital Management System", title_style))
    elements.append(Paragraph("Appointment Report", styles['Heading2']))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    appointments = Appointment.objects.select_related('patient', 'doctor').all()
    
    if appointments.exists():
        data = [['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Status']]
        
        for apt in appointments:
            # Handle patient name
            if hasattr(apt.patient, 'first_name') and hasattr(apt.patient, 'last_name'):
                patient_name = f"{apt.patient.first_name} {apt.patient.last_name}"
            elif hasattr(apt.patient, 'name'):
                patient_name = apt.patient.name
            else:
                patient_name = f"Patient {apt.patient.id}"
            
            # Handle doctor name (using 'name' field as per your model)
            if hasattr(apt.doctor, 'name'):
                doctor_name = f"Dr. {apt.doctor.name}"
            elif hasattr(apt.doctor, 'first_name') and hasattr(apt.doctor, 'last_name'):
                doctor_name = f"Dr. {apt.doctor.first_name} {apt.doctor.last_name}"
            else:
                doctor_name = f"Dr. {apt.doctor.id}"
            
            data.append([
                str(apt.id),
                patient_name,
                doctor_name,
                apt.appointment_date.strftime('%Y-%m-%d'),
                apt.appointment_time.strftime('%H:%M') if apt.appointment_time else '-',
                apt.status
            ])
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
        ]))
        
        elements.append(table)
    else:
        elements.append(Paragraph("No appointments found in the system.", styles['Normal']))
    
    # Footer
    elements.append(Spacer(1, 30))
    elements.append(Paragraph(f"Total Appointments: {appointments.count()}", styles['Normal']))
    
    doc.build(elements)
    return response
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_single_patient_report(request, patient_id):
    """Generate PDF report for a single specific patient"""
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return HttpResponse("Patient not found", status=404)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="patient_{patient_id}_report.pdf"'

    doc = SimpleDocTemplate(response, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    if hasattr(patient, 'first_name') and hasattr(patient, 'last_name'):
        full_name = f"{patient.first_name} {patient.last_name}"
    elif hasattr(patient, 'name'):
        full_name = patient.name
    else:
        full_name = f"Patient {patient.id}"

    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=22, spaceAfter=20, alignment=1)
    elements.append(Paragraph("Hospital Management System", title_style))
    elements.append(Paragraph("Individual Patient Report", styles['Heading2']))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Patient Information", styles['Heading3']))
    info_data = [
        ['Full Name', full_name],
        ['Email', patient.email],
        ['Phone', patient.phone],
        ['Gender', patient.gender if hasattr(patient, 'gender') else '-'],
        ['Blood Group', patient.blood_group if hasattr(patient, 'blood_group') else '-'],
        ['Registered On', patient.created_at.strftime('%Y-%m-%d') if hasattr(patient, 'created_at') else '-'],
    ]
    info_table = Table(info_data, colWidths=[150, 300])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 0), (0, -1), colors.whitesmoke),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Appointment History", styles['Heading3']))
    appointments = Appointment.objects.filter(patient=patient).select_related('doctor')

    if appointments.exists():
        apt_data = [['Doctor', 'Date', 'Time', 'Status']]
        for apt in appointments:
            if hasattr(apt.doctor, 'name'):
                doctor_name = f"Dr. {apt.doctor.name}"
            elif hasattr(apt.doctor, 'first_name') and hasattr(apt.doctor, 'last_name'):
                doctor_name = f"Dr. {apt.doctor.first_name} {apt.doctor.last_name}"
            else:
                doctor_name = f"Dr. {apt.doctor.id}"

            apt_data.append([
                doctor_name,
                apt.appointment_date.strftime('%Y-%m-%d'),
                apt.appointment_time.strftime('%H:%M') if apt.appointment_time else '-',
                apt.status
            ])

        apt_table = Table(apt_data, colWidths=[150, 100, 80, 100])
        apt_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
        ]))
        elements.append(apt_table)
    else:
        elements.append(Paragraph("No appointments found for this patient.", styles['Normal']))

    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Billing History", styles['Heading3']))
    bills = Billing.objects.filter(patient=patient)

    if bills.exists():
        bill_data = [['Bill #', 'Amount', 'Status', 'Payment Method', 'Date']]
        total_paid = 0
        for bill in bills:
            date_str = bill.paid_at.strftime('%Y-%m-%d') if bill.paid_at else bill.created_at.strftime('%Y-%m-%d')
            bill_data.append([
                bill.bill_number,
                f"Rs{bill.total_amount}",
                bill.status,
                bill.payment_method or '-',
                date_str
            ])
            if bill.status == 'Paid':
                total_paid += float(bill.total_amount)

        bill_table = Table(bill_data, colWidths=[100, 80, 80, 100, 90])
        bill_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
        ]))
        elements.append(bill_table)
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(f"Total Paid: Rs{total_paid:.2f}", styles['Heading4']))
    else:
        elements.append(Paragraph("No billing records found for this patient.", styles['Normal']))

    doc.build(elements)
    return response
