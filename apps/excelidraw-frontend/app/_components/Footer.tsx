import { Github } from "lucide-react";
const Footer = () => {
    return (
      <footer className="border-t">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-sm text-color1 ">
              © 2025 Excalidraw Clone. All rights reserved.
            </p>
            <div className="flex flex-col items-center justify-between space-x-6">
              <a href="https://github.com/Tusharshah3" className="text-color1 hover:text-white/70 flex justify-between">
              <Github className="flex justify-between" />-@Tushar 
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
              </a>
            </div>
          </div>
        </div>
      </footer>
    )
}

export default Footer