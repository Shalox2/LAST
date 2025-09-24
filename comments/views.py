from rest_framework import viewsets, permissions, status, serializers as drf_serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Comment
from .serializers import CommentSerializer
from django.views.generic import TemplateView, View
from django.http import HttpResponse
import os
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        shop_id = self.request.query_params.get('shop_id')
        product_id = self.request.query_params.get('product_id')
        
        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
            
        return queryset.select_related('user', 'shop', 'product', 'parent').order_by('-created_at')
    
    def perform_create(self, serializer):
        parent_id = self.request.data.get('parent')
        if parent_id:
            parent = Comment.objects.get(id=parent_id)
            if parent.is_reply:
                raise drf_serializers.ValidationError("Cannot reply to a reply")
            serializer.save(
                user=self.request.user,
                is_reply=True,
                shop=parent.shop,
                product=parent.product,
                parent=parent
            )
        else:
            # Enforce that only buyers who have ordered a product can comment on that product
            product_id = self.request.data.get('product')
            if product_id:
                # Optional role check
                if getattr(self.request.user, 'role', None) and self.request.user.role != 'buyer':
                    raise drf_serializers.ValidationError("Only buyers can comment on products")
                try:
                    from orders.models import Order
                    has_order = Order.objects.filter(
                        buyer=self.request.user,
                        product_id=product_id
                    ).exists()
                except Exception:
                    has_order = False
                if not has_order:
                    raise drf_serializers.ValidationError("You can only comment on products you have ordered")
            serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        parent = self.get_object()
        if parent.is_reply:
            return Response(
                {"error": "Cannot reply to a reply"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                user=request.user,
                parent=parent,
                is_reply=True,
                shop=parent.shop,
                product=parent.product
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def by_shop(self, request, shop_id=None):
        if not shop_id:
            return Response("Shop ID is required", status=status.HTTP_400_BAD_REQUEST)
        comments = self.get_queryset().filter(shop_id=shop_id, parent__isnull=True)
        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_product(self, request, product_id=None):
        if not product_id:
            return Response("Product ID is required", status=status.HTTP_400_BAD_REQUEST)
        comments = self.get_queryset().filter(product_id=product_id, parent__isnull=True)
        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)

