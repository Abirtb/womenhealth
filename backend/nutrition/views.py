from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from services.ai_diet_engine import generate_meal_plan

from .models import DietPlan, FoodItem
from .serializers import DietPlanSerializer, FoodItemSerializer


class FoodListView(generics.ListAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = FoodItemSerializer
    queryset = FoodItem.objects.all()


class DietPlanView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = DietPlanSerializer

    def get_queryset(self):
        return DietPlan.objects.filter(user=self.request.user)


class GenerateDietView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        week_number = int(request.data.get("week_number", 1))
        foods = list(
            FoodItem.objects.values("id", "name", "category", "organic", "safety_score", "farm_origin")
        )
        user = request.user
        plan_json = generate_meal_plan(
            pregnancy_stage=user.pregnancy_stage,
            allergies=user.allergies or "",
            dietary_restrictions=user.dietary_restrictions or "",
            available_foods=foods,
            week_number=week_number,
        )
        diet, _created = DietPlan.objects.update_or_create(
            user=user,
            week_number=week_number,
            defaults={
                "meals": plan_json,
                "recommendations": plan_json.get("trimester_focus", ""),
            },
        )
        return Response(DietPlanSerializer(diet).data, status=status.HTTP_201_CREATED)
