from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q
from .models import Product
from .serializers import ProductSerializer, ProductCreateSerializer

class ProductListCreateView(generics.ListCreateAPIView):
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        shop_id = self.request.query_params.get('shop', None)
        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductSerializer
    
    def create(self, request, *args, **kwargs):
        # Only sellers can create products
        if request.user.role != 'seller':
            return Response({'error': 'Only sellers can create products'}, 
                          status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
