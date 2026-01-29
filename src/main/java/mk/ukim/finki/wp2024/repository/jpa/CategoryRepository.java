package mk.ukim.finki.wp2024.repository.jpa;

import mk.ukim.finki.wp2024.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    void deleteByName(String name);

    List<Category> findAllByNameLike(String name);
}
