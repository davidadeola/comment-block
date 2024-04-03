import logging
from datetime import datetime
from http import HTTPStatus
import geoip2.webservice
from timezones import zones

import pytz
from django.http import JsonResponse
from django.utils import timezone
from django.conf import settings
from users.utils import check_if_device_exists, get_user_by_access_token
from errors.views import ErrorCodes, get_error


# Get an instance of a logger
logger = logging.getLogger(__name__)


def bad_request_response(data):
    return error_response(HTTPStatus.BAD_REQUEST, data)


def un_authorized_response(data):
    return error_response(HTTPStatus.FORBIDDEN, data)


def un_authenticated_response(data):
    return error_response(HTTPStatus.UNAUTHORIZED, data)


def resource_conflict_response(data):
    return error_response(HTTPStatus.CONFLICT, data)


def resource_not_found_response(data):
    return error_response(HTTPStatus.NOT_FOUND, data)


def internal_server_error_response(data):
    return error_response(HTTPStatus.INTERNAL_SERVER_ERROR, data)


def error_response(http_status_code, data):
    return JsonResponse(data, status=http_status_code, safe=False)


# success responses
def created_response(message="", body=None):
    return success_response(HTTPStatus.CREATED, message=message, body=body)


def paginated_response(http_status_code=HTTPStatus.OK, message="", body=None, pagination=None, **kwargs):
    return success_response(http_status_code, message, body, pagination, kwargs)


def success_response(http_status_code=HTTPStatus.OK, message="", body=None, pagination=None, kwargs=None, need_list=None):
    if not body:
        if need_list:
            body = []
        else:
            body = {}
    response_data = {}
    response_data['data'] = body
    response_data['metaData'] = kwargs
    response_data['message'] = message

    if pagination:
        response_data['pagination'] = pagination
        if not response_data['data']:
            response_data['data'] = []

    response = JsonResponse(response_data, status=http_status_code, safe=False)

    return response


def to_ui_readable_date_format(value):
    try:
        if value is None:
            return ""

        localized_value = timezone.localtime(
            value, pytz.timezone('Africa/lagos'))
        return datetime.strftime(localized_value, "%b %d, %Y %I:%M%p")
    except Exception as ex:
        print(ex)
        return str(value)

def convert_timestamp_to_ui_readable_datetime_format(value):
    try:
        if value is None:
            return ""
        print(value)
        datetime_obj = datetime.fromtimestamp(value)
        formatted_datetime = datetime_obj.strftime("%b %d, %Y %I:%M%p")

        return formatted_datetime
    except Exception as ex:
        print(ex)
        return str(value)

def login_response(msg, body, token=None, is_new_device=None, device_limit_exceeded=None):
    try:
        body['Access-Token'] = token
        if is_new_device:
            body['is_new_device'] = is_new_device
        if device_limit_exceeded:
            body['device_limit_exceeded'] = device_limit_exceeded
        response = success_response(message=msg, body=body)
        # # include access-token in response cookies

        # response.set_cookie(
        #     key='Access-Token',
        #     value=token.access_token,
        #     expires=str(token.expires_at),
        #     httponly=True
        # )
        return response
    except Exception as e:
        logger.error("setting_cookie@Error")
        logger.error(str(e))
        return None


def get_ip_address_location(ip_address):
    try:
        license_key = settings.GEO_IP_LICENCE_KEY
        account_id = int(settings.GEO_IP_ACCOUNT_ID)
        response = ''
        city_response = ''
        country_response = ''
        with geoip2.webservice.Client(account_id, license_key, 'geolite.info.') as client:
            response = client.city(ip_address)
            city_response = response.city.name
            country_response = response.country.name
            logger.error(country_response)
            logger.error(city_response)
        location = f"{city_response}/{country_response}"
        return location
    except Exception as e:
        logger.error("get_ip_address_location@Error")
        logger.error(str(e))
        return None


def get_timezones(request):
    # # verify that the calling user has a valid token
    # token = request.headers.get('Access-Token')
    # if token is None:
    #     return bad_request_response(get_error
    #                                 (ErrorCodes.INVALID_CREDENTIALS,
    #                                  "Access-Token is missing in the request headers"))

    # user = get_user_by_access_token(token)
    # if not user:
    #     return un_authenticated_response(get_error
    #                                      (ErrorCodes.UNAUTHENTICATED_REQUEST,
    #                                       "Your session has expired, Please login."))

    # verified_user_device = check_if_device_exists(request, user)
    # if not verified_user_device:
    #     return un_authenticated_response(get_error(ErrorCodes.UNAUTHENTICATED_REQUEST, "Please login to continue"))

    all_timezones = []
    for tz_offset, tz_name, tz_formated in zones.get_timezones():
        all_timezones.append(tz_formated)

    data = {
        "timezones": all_timezones
    }

    return success_response(message="success", body=data)
