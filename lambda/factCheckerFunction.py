import json
import boto3

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        text = body.get('text', '')
        affiliation_val = body.get('affiliation', '').lower()

        # --- STEP 1: Internal DB Triage ---
        if affiliation_val:
            internal_payload = {
                "body": json.dumps({
                    "text": text, 
                    "company": affiliation_val 
                }),
                "isBase64Encoded": False
            }
            
            internal_res = invoke_lambda('factcheck-internal-db', internal_payload)
            internal_data = json.loads(internal_res.get('body', '{}'))
            
            # If internal KB knows the answer, return with affiliation as source
            if internal_data.get('label') != "unknown":
                return format_response(internal_data, source=affiliation_val, is_public=False)

        # --- STEP 2: Fallback to Public Search ---
        # Wrapping in 'body' to satisfy the public lambda's Proxy Integration
        public_payload = {
            "body": json.dumps({"claim": text})
        }
        
        public_raw = invoke_lambda('factCheckerFinalFinalFinal', public_payload)
        public_data = json.loads(public_raw.get('body', '{}'))
        
        return format_response(public_data, source="public", is_public=True)

    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

def invoke_lambda(name, payload):
    response = lambda_client.invoke(
        FunctionName=name,
        InvocationType='RequestResponse',
        Payload=json.dumps(payload)
    )
    return json.loads(response['Payload'].read().decode('utf-8'))

def format_response(raw_data, source, is_public):
    # Map truth_label (public) vs label (internal)
    raw_label = raw_data.get('truth_label') if is_public else raw_data.get('label')
    verdict = str(raw_label).upper() if raw_label else "UNKNOWN"
    
    # Map claim (public) vs text (internal)
    claim_text = raw_data.get('claim') or raw_data.get('text')

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({
            "verdict": verdict,
            "confidence": raw_data.get('confidence'),
            "summary": raw_data.get('summary'),
            "source": source, # Will be "public" or the affiliation name (e.g. "aws")
            "claim": claim_text,
            "citations": raw_data.get('citations', []),
            "is_internal": not is_public
        })
    }
