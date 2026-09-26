// Interface Segregation Principle
interface Printer {
  print(): void;
}

interface Scanner {
  scan(): void;
}

interface Fax {
  fax(): void;
}

class AllInOnePrinter implements Printer, Scanner, Fax {
  print(): void {
    console.log("Printing");
  }

  scan(): void {
    console.log("Scanning");
  }

  fax(): void {
    console.log("Faxing");
  }
}

class PrinterOnly implements Printer {
  print(): void {
    console.log("Printing");
  }
}

class ScannerOnly implements Scanner {
  scan(): void {  
    console.log("Scanning");
  }
}

class FaxOnly implements Fax {
  fax(): void {
    console.log("Faxing");
  }
}

const allInOnePrinter = new AllInOnePrinter();
const printer = new PrinterOnly();
const scanner = new ScannerOnly();
const fax = new FaxOnly();


allInOnePrinter.print();
allInOnePrinter.scan();
allInOnePrinter.fax();
printer.print();
scanner.scan();
fax.fax();
