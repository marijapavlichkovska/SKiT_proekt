package mk.ukim.finki.wp2024.service.impl;

import mk.ukim.finki.wp2024.model.Category;
import mk.ukim.finki.wp2024.model.exceptions.CategoryNotFoundException;
import mk.ukim.finki.wp2024.repository.jpa.CategoryRepository;
import mk.ukim.finki.wp2024.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<Category> listCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Optional<Category> create(String name, String description) {
        if (name == null || name.isEmpty() || description == null || description.isEmpty()) {
            throw new IllegalArgumentException();
        }

        Category category = new Category(name, description);
        return Optional.of(categoryRepository.save(category));
    }

    @Override
    public Optional<Category> update(Long id, String name, String description) {
        if (id == null || name == null || name.isEmpty() || description == null || description.isEmpty()) {
            throw new IllegalArgumentException();
        }

        Category category = categoryRepository.findById(id).orElseThrow(() -> new CategoryNotFoundException(id));

        category.setName(name);
        category.setDescription(description);

        return Optional.of(categoryRepository.save(category));
    }

    @Override
    public void delete(String name) {
        categoryRepository.deleteByName(name);
    }

    @Override
    public void deleteById(Long id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public List<Category> searchCategories(String text) {
        return categoryRepository.findAllByNameLike(text);
    }

    @Override
    public Optional<Category> findById(Long id) {
        return this.categoryRepository.findById(id);
    }
}
