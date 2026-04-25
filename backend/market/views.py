from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .geo import haversine_km, to_float
from .models import ProductAvailability
from .serializers import FoodItemSerializer, NearbyFoodSerializer


def _parse_bool(value):
    if value is None:
        return None
    return str(value).lower() in ("1", "true", "yes")


class NearbyFoodView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        try:
            lat = float(request.query_params.get("lat"))
            lng = float(request.query_params.get("lng"))
        except (TypeError, ValueError):
            return Response({"detail": "Query params lat and lng are required floats."}, status=400)

        radius = float(request.query_params.get("radius_km", 25))
        organic_only = _parse_bool(request.query_params.get("organic"))
        min_safety = request.query_params.get("min_safety")
        min_safety_val = int(min_safety) if min_safety not in (None, "") else None

        qs = ProductAvailability.objects.filter(in_stock=True).select_related(
            "seller__location", "food_item"
        )

        rows = []
        for row in qs:
            loc = row.seller.location
            dist = haversine_km(lat, lng, to_float(loc.latitude), to_float(loc.longitude))
            if dist > radius:
                continue
            food = row.food_item
            if organic_only and not food.organic:
                continue
            if min_safety_val is not None and food.safety_score < min_safety_val:
                continue
            rows.append((dist, row))

        rows.sort(key=lambda item: item[0])
        data = []
        for dist, row in rows:
            item = dict(NearbyFoodSerializer(row).data)
            item["distance_km"] = round(dist, 2)
            data.append(item)
        return Response(data)



class FoodByLocationView(APIView):
    """
    Same geo search but returns food-centric list (unique foods with nearest seller).
    """

    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        try:
            lat = float(request.query_params.get("lat"))
            lng = float(request.query_params.get("lng"))
        except (TypeError, ValueError):
            return Response({"detail": "lat and lng are required."}, status=400)

        radius = float(request.query_params.get("radius_km", 25))
        organic_only = _parse_bool(request.query_params.get("organic"))
        min_safety = request.query_params.get("min_safety")
        min_safety_val = int(min_safety) if min_safety not in (None, "") else None

        best: dict[int, tuple[float, ProductAvailability]] = {}
        qs = ProductAvailability.objects.filter(in_stock=True).select_related("seller__location", "food_item")
        for row in qs:
            loc = row.seller.location
            dist = haversine_km(lat, lng, to_float(loc.latitude), to_float(loc.longitude))
            if dist > radius:
                continue
            food = row.food_item
            if organic_only and not food.organic:
                continue
            if min_safety_val is not None and food.safety_score < min_safety_val:
                continue
            fid = food.id
            if fid not in best or dist < best[fid][0]:
                best[fid] = (dist, row)

        payload = []
        for dist, row in sorted(best.values(), key=lambda x: x[0]):
            payload.append(
                {
                    "distance_km": round(dist, 2),
                    "food": FoodItemSerializer(row.food_item).data,
                    "seller": row.seller.name,
                    "location": {
                        "label": row.seller.location.label,
                        "latitude": str(row.seller.location.latitude),
                        "longitude": str(row.seller.location.longitude),
                    },
                    "price_cents": row.price_cents,
                }
            )
        return Response(payload)
