from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Full CRUD serializer for admins managing users. Password is optional on update."""

    password = serializers.CharField(write_only=True, required=False, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["id", "username", "password", "gender", "is_staff", "is_active", "date_joined"]
        read_only_fields = ["date_joined"]

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if self.instance is None and not attrs.get("password"):
            raise serializers.ValidationError({"password": "This field is required."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class LoginResponseSerializer(serializers.Serializer):
    token = serializers.CharField(required=False)
    username = serializers.CharField(required=False)
    gender = serializers.CharField(required=False)
    otp_required = serializers.BooleanField(required=False)


class TwoFactorStatusSerializer(serializers.Serializer):
    enabled = serializers.BooleanField()


class TwoFactorSetupSerializer(serializers.Serializer):
    qr_code = serializers.CharField()
    secret = serializers.CharField()


class TwoFactorTokenSerializer(serializers.Serializer):
    otp_token = serializers.CharField(min_length=6, max_length=6)
