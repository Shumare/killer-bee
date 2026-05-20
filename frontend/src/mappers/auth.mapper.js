export function mapLoginResponseToUser(dto) {
    return {
        id: dto.username,
        name: dto.full_name,
        email: '',
    };
}
export function mapLoginResponseToSession(dto) {
    return {
        token: dto.access_token,
        userId: dto.username,
    };
}
