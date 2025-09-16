from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'comments', views.CommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
    path('shops/<int:shop_id>/comments/', views.CommentViewSet.as_view({'get': 'by_shop', 'post': 'create'})),
    path('products/<int:product_id>/comments/', views.CommentViewSet.as_view({'get': 'by_product', 'post': 'create'})),
]
