export function mapUserResponseToUser(dto) {
    return {
        id: String(dto.user_id),
        name: dto.full_name,
        email: dto.email,
    };
}
