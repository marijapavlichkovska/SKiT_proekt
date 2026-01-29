package mk.ukim.finki.wp2024.repository.jpa;

import mk.ukim.finki.wp2024.model.Product;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaSpecificationRepository<Product, Long> {
    Optional<Product> findByName(String name);
}
