export function mapLoginResponseToUser(dto) {
    return {
        id: dto.user_id,
        name: dto.full_name,
        email: '',
    };
}
export function mapLoginResponseToSession(dto) {
    return {
        token: dto.access_token,
        userId: dto.user_id,
    };
}
