package com.example.demo.users;

import com.example.demo.common.DateTimeMapper;
import com.example.demo.model.CreateUserRequest;
import com.example.demo.model.UserDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {DateTimeMapper.class})
public interface UserMapper {

    @Mapping(source = "role.name", target = "role")
    UserDto toDto(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(CreateUserRequest request);
}