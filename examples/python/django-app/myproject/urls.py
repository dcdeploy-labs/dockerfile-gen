from django.http import JsonResponse
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

def hello(request):
    return JsonResponse({"message": "Hello from Django!", "status": "running"})

def health(request):
    return JsonResponse({"status": "OK"})

urlpatterns = [
    path("", hello),
    path("health/", health),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
