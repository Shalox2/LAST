from django.contrib import admin
from django.urls import path, include,re_path
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static


def health(_request):
    return JsonResponse({"status": "ok", "service": "weshop"})

urlpatterns = [
    path('', health, name='root'),
    path('healthz/', health, name='healthz'),
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('shops.urls')),
    path('api/', include('products.urls')),
    path('api/', include('orders.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/', include('comments.urls')),

   
 
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
