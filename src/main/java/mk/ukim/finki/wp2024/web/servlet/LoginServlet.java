package mk.ukim.finki.wp2024.web.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import mk.ukim.finki.wp2024.model.User;
import mk.ukim.finki.wp2024.service.AuthService;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.web.IWebExchange;
import org.thymeleaf.web.servlet.JakartaServletWebApplication;

import java.io.IOException;

@WebServlet(name = "login-servlet", urlPatterns = "/servlet/login")
public class LoginServlet extends HttpServlet {
    private final SpringTemplateEngine springTemplateEngine;
    private final AuthService authenticationService;

    public LoginServlet(SpringTemplateEngine springTemplateEngine, AuthService authenticationService) {
        this.springTemplateEngine = springTemplateEngine;
        this.authenticationService = authenticationService;
    }
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        IWebExchange webExchange = JakartaServletWebApplication
                .buildApplication(getServletContext())
                .buildExchange(req, resp);

        WebContext context = new WebContext(webExchange);

        springTemplateEngine.process("login.html", context, resp.getWriter());
    }
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        IWebExchange webExchange = JakartaServletWebApplication
                .buildApplication(getServletContext())
                .buildExchange(req, resp);

        WebContext context = new WebContext(webExchange);
        String username = req.getParameter("username");
        String password = req.getParameter("password");

        User user = null;

        try {
            user = authenticationService.login(username, password);
        } catch (RuntimeException exception) {
            // If an exception is thrown, set the hasError variable to true and set the error message
            context.setVariable("hasError", true);
            context.setVariable("error", exception.getMessage());
            springTemplateEngine.process("login.html", context, resp.getWriter());
        }

        if (user != null) {
            // Set the user in the session
            req.getSession().setAttribute("user", user);

            // Redirect to the category page
            resp.sendRedirect("/servlet/category");
        }
    }
}
