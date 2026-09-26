from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Read-only view of a user — used in login response & employee list."""

    is_superuser = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'phone', 'role', 'is_active', 'is_superuser', 'two_factor_enabled', 'created_at']


class CustomerProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'phone', 'two_factor_enabled']

    def validate(self, attrs):
        restricted_fields = {'role', 'is_active', 'is_staff', 'is_superuser', 'username'}
        attempted_fields = restricted_fields.intersection(self.initial_data)
        if attempted_fields:
            raise serializers.ValidationError({field: 'This field cannot be changed here.' for field in attempted_fields})
        return attrs


class CustomerSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'name', 'phone']

    def create(self, validated_data):
        return User.objects.create_user(role=User.CUSTOMER, **validated_data)


class CreateEmployeeSerializer(serializers.ModelSerializer):
    """Used by the admin to create a new employee account."""

    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'name', 'email', 'phone']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(role=User.EMPLOYEE, **validated_data)
        user.set_password(password)
        user.save()
        return user
