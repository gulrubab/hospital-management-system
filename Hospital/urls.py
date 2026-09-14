from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

def home(request):
    return JsonResponse({
        "message": "Hospital Management System API is running",
        "version": "1.0",
    })

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    
    # JWT Authentication
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # App URLs
    path('api/', include('patients.urls')),
    path('api/', include('doctors.urls')),
    path('api/', include('appointments.urls')),
    path('api/', include('prescriptions.urls')),
    path('api/', include('billing.urls')),
    path('api/', include('authentication.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    
    # Pharmacy URLs - ADD THIS LINE
    path('api/', include('pharmacy.urls')),
    path('api/', include('labreports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
