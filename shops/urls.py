from django.urls import path
from . import views

urlpatterns = [
    path('shops/', views.ShopListCreateView.as_view(), name='shop-list-create'),
    path('shops/<int:pk>/', views.ShopDetailView.as_view(), name='shop-detail'),
    path('shops/join-payment/', views.join_payment, name='shop-join-payment'),
    path('shops/<int:shop_id>/verify/', views.verify_shop, name='shop-verify'),
    path('shops/<int:shop_id>/documents/', views.upload_documents, name='shop-document-upload'),
    path('<int:shop_id>/audit-trail/', views.verification_audit_trail, name='verification-audit-trail'),
    path('<int:shop_id>/comments/', views.ShopCommentListCreateView.as_view(), name='shop-comments'),
    path('comments/helpful/', views.CommentHelpfulView.as_view(), name='comment-helpful'),
    path('shops/<int:shop_id>/contact-seller/', views.ProductInquiryView.as_view(), name='contact-seller'),
]
