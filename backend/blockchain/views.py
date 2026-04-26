import json
from pathlib import Path
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


def load_blockchain_data():
    """Load blockchain traceability JSON"""
    try:
        json_path = Path(__file__).parent / 'traceability_log.json'
        with open(json_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []


@api_view(['GET'])
def verify_product_blockchain(request, product_id):
    """
    Get blockchain verification for a product by product_id.
    Excludes blockchain_tx_hash from response.
    Returns supply chain events: harvest, processing, packaging, distribution, retail.
    """
    try:
        blockchain_data = load_blockchain_data()
        
        # Filter events for this product_id
        events = [
            event for event in blockchain_data 
            if event.get('product_id') == product_id
        ]
        
        if not events:
            return Response({
                'verified': False,
                'product_id': product_id,
                'message': 'No blockchain verification found for this product'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Group events by type and build supply chain timeline
        supply_chain = {
            'product_id': product_id,
            'verified': True,
            'total_events': len(events),
            'events': [],
            'certifications': set(),
            'locations': set(),
        }
        
        # Sort by timestamp
        sorted_events = sorted(events, key=lambda x: x.get('timestamp', ''), reverse=True)
        
        for event in sorted_events:
            event_info = {
                'event_type': event.get('event_type', 'unknown'),
                'timestamp': event.get('timestamp', ''),
                'actor_role': event.get('actor_role', ''),
                'actor_id': event.get('actor_id', ''),
                'quantity': event.get('quantity', 0),
                'unit_of_measure': event.get('unit_of_measure', 'kg'),
                'event_notes': event.get('event_notes', ''),
                'certification_type': event.get('certification_type', ''),
                'certification_id': event.get('certification_id', ''),
                'location': {
                    'name': event.get('location_name', ''),
                    'city': event.get('location_city', ''),
                    'state': event.get('location_state', ''),
                    'country': event.get('location_country', ''),
                    'address': event.get('location_street_address', ''),
                    'postal_code': event.get('location_postal_code', ''),
                }
            }
            supply_chain['events'].append(event_info)
            
            # Collect certifications and locations
            if event.get('certification_type'):
                supply_chain['certifications'].add(event.get('certification_type'))
            if event.get('location_city'):
                supply_chain['locations'].add(f"{event.get('location_city')}, {event.get('location_state')}")
        
        # Convert sets to lists
        supply_chain['certifications'] = list(supply_chain['certifications'])
        supply_chain['locations'] = list(supply_chain['locations'])
        
        return Response(supply_chain, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': str(e),
            'verified': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def blockchain_stats(request):
    """Get overall blockchain statistics"""
    try:
        blockchain_data = load_blockchain_data()
        
        # Count unique products and events
        product_ids = set(event.get('product_id') for event in blockchain_data)
        event_types = set(event.get('event_type') for event in blockchain_data)
        
        return Response({
            'total_events': len(blockchain_data),
            'verified_products': len(product_ids),
            'event_types': list(event_types)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
