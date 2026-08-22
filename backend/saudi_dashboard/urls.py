"""
URL configuration for saudi_dashboard project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.utils.translation import gettext_lazy as _
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.permissions import AllowAny

admin.site.site_header = _('لوحة تحكم السعودية')
admin.site.site_title = _('لوحة تحكم السعودية')
admin.site.index_title = _('الإدارة')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('rosetta/', include('rosetta.urls')),
    path('api/', include('accounts.api_urls')),
    path('api/', include('dashboard.api_urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/schema/', SpectacularAPIView.as_view(permission_classes=[AllowAny]), name='schema'),
    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='schema', permission_classes=[AllowAny]),
        name='swagger-ui',
    ),
    path(
        'api/redoc/',
        SpectacularRedocView.as_view(url_name='schema', permission_classes=[AllowAny]),
        name='redoc',
    ),
    path('users/', include('accounts.urls')),
    path('i18n/', include('django.conf.urls.i18n')),
    path('', include('dashboard.urls')),
]
