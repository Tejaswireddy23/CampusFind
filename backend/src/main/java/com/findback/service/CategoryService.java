package com.findback.service;

import com.findback.dto.CategoryDto;
import com.findback.model.Category;
import com.findback.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> new CategoryDto(
                        cat.getId(),
                        cat.getName(),
                        cat.getIcon(),
                        cat.getDescription()
                ))
                .collect(Collectors.toList());
    }

    public Category createCategory(String name, String icon, String description) {
        Category category = new Category(name, icon, description);
        return categoryRepository.save(category);
    }
}
