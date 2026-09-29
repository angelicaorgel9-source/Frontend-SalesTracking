from rest_framework import generics
from rest_framework.permissions import AllowAny

from accounts.permissions import IsAdmin
from .models import Branch
from .serializers import BranchSerializer


class BranchListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/branches/  -> public, anyone can see the shop locations
    POST /api/branches/  -> admin only, add a new branch
    """

    queryset = Branch.objects.filter(is_active=True)
    serializer_class = BranchSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]


class BranchDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET              /api/branches/<id>/  -> public
    PUT/PATCH/DELETE /api/branches/<id>/  -> admin only
    """

    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdmin()]
