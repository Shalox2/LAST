from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, CreateMessageSerializer
from orders.models import Order


from django.views.generic import TemplateView
class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(participants=user).order_by('-updated_at')

class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_id'
    lookup_url_kwarg = 'order_id'

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(participants=user)

class StartConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        
        # Check if user is buyer or seller for this order
        if request.user not in [order.buyer, order.product.shop.owner]:
            return Response(
                {"detail": "You don't have permission to start a conversation for this order."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Create or get conversation
        conversation, created = Conversation.objects.get_or_create(
            order=order,
            defaults={
                'order': order
            }
        )
        
        # Add participants if not already added
        participants = [order.buyer, order.product.shop.owner]
        conversation.participants.add(*participants)
        
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class MessageListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateMessageSerializer
        return MessageSerializer

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        return Message.objects.filter(conversation_id=conversation_id).order_by('timestamp')

    def perform_create(self, serializer):
        conversation = get_object_or_404(Conversation, id=self.kwargs['conversation_id'])
        
        # Check if user is a participant in the conversation
        if self.request.user not in conversation.participants.all():
            raise permissions.PermissionDenied("You are not a participant in this conversation.")
        
        serializer.save(conversation=conversation, sender=self.request.user)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        # Mark messages as read when listing them
        conversation_id = self.kwargs['conversation_id']
        Message.objects.filter(
            conversation_id=conversation_id
        ).exclude(sender=request.user).update(is_read=True)
        
        return response

from django.views.generic import View
from django.http import HttpResponse
import os

class FrontendAppView(View):
    def get(self, request):
        try:
            with open(os.path.join("frontend/build", "index.html")) as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            return HttpResponse(
                "Build ya React haijapatikana. Tafadhali endesha `npm run build`.",
                status=501,
            )


class FrontendAppView(TemplateView):
    template_name = "index.html"
