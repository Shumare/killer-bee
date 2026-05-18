export function mapUserResponseToUser(dto) {
    return {
        id: dto.user_id,
        name: dto.full_name,
        email: dto.email,
    };
}
