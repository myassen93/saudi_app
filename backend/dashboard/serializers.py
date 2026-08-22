from rest_framework import serializers


class GenderCountSerializer(serializers.Serializer):
    gender = serializers.CharField()
    label = serializers.CharField()
    count = serializers.IntegerField()


class DashboardStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    gender_counts = GenderCountSerializer(many=True)
