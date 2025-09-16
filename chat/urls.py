from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/order/<int:order_id>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('orders/<int:order_id>/start-chat/', views.StartConversationView.as_view(), name='start-conversation'),
    path('conversations/<int:conversation_id>/messages/', views.MessageListView.as_view(), name='message-list'),
]
