package mk.ukim.finki.wp2024.selenium;

import lombok.Getter;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.junit.Assert;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

import java.util.List;

@Getter
public class CategoriesPage extends AbstractPage {

    public CategoriesPage(WebDriver driver) {
        super(driver);
    }

    @FindBy(css = ".category")
    private List<WebElement> rows;

    public static CategoriesPage to(WebDriver driver) {
        get(driver, "/categories");
        return PageFactory.initElements(driver, CategoriesPage.class);
    }

    public void assertElements(int productsNumber) {
        Assert.assertEquals("rows do not match", productsNumber, this.rows.size());
    }
}

