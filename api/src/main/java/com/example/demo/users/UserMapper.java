package com.example.demo.users;

import com.example.demo.common.DateTimeMapper;
import com.example.demo.model.CreateUserRequest;
import com.example.demo.model.PageUserDto;
import com.example.demo.model.UserDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring", uses = {DateTimeMapper.class})
public interface UserMapper {

    @Mapping(source = "role", target = "role")
    UserDto toDto(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(CreateUserRequest request);

    default PageUserDto toPageDto(Page<UserDto> page) {
        PageUserDto pageDto = new PageUserDto();
        pageDto.setContent(page.getContent());
        pageDto.setTotalElements(page.getTotalElements());
        pageDto.setTotalPages(page.getTotalPages());
        pageDto.setSize(page.getSize());
        pageDto.setNumber(page.getNumber());
        return pageDto;
    }
}
