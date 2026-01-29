package mk.ukim.finki.wp2024.service;

import mk.ukim.finki.wp2024.model.Product;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface ProductService {

    List<Product> findAll();

    Page<Product> findPage(String name, Long categoryId, Long manufacturerId, Integer pageNum, Integer pageSize);

    Optional<Product> findById(Long id);

    Optional<Product> findByName(String name);

    Optional<Product> save(String name, Double price, Integer quantity, Long category, Long manufacturer);

    Optional<Product> update(Long id, String name, Double price, Integer quantity, Long categoryId, Long manufacturerId);

    void deleteById(Long id);
}

