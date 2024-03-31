import java.util.Scanner

fun main() {
    val scanner = Scanner(System.`in`)

    // Read two integers from the user
    print("Enter first integer: ")
    val num1 = scanner.nextInt()
    print("Enter second integer: ")
    val num2 = scanner.nextInt()

    // Calculate the sum
    val sum = num1 + num2

    // Print the sum
    println("Sum of $num1 and $num2 is $sum")
}
