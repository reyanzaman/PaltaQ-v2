"""
Serializers for the user API View.
"""
from django.contrib.auth import (
    get_user_model,
    authenticate,
)
from django.utils.translation import gettext as _

from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the user object."""

    class Meta:
        model = get_user_model()
        fields = ['email', 'password', 'std_id', 'disp_name', 'institution']
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 5},
            'disp_name': {'min_length': 3},
            'institution': {'required': True},
            'std_id': {'required': True}
        }

    def create(self, validated_data):
        """Create a new user with encrypted password and return it."""
        return get_user_model().objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        """Update and return user."""
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
            user.save()

        return user

    def validate(self, data):
        UserModel = get_user_model()
        std_id = data.get('std_id')
        institution = data.get('institution')

        if UserModel.objects.filter(
            std_id=std_id,
            institution=institution
        ).exists():
            raise serializers.ValidationError(
                "A user with this Student/Faculty ID already exists "
                + "in the given institution."
            )

        return data

    def validate_std_id(self, value):
        if not (1000 <= value <= 9999999):
            raise serializers.ValidationError(
                "Student/Faculty ID must be between 4 and 7 digits."
            )
        return value


class AuthTokenSerializer(serializers.Serializer):
    """Serializer for the user authentication object."""

    email = serializers.EmailField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False,
    )

    def validate(self, attrs):
        """Validate and authenticate the user."""
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password,
        )

        if not user:
            msg = _('Unable to authenticate with provided credentials.')
            raise serializers.ValidationError(msg, code='authentication')

        attrs['user'] = user
        return attrs
