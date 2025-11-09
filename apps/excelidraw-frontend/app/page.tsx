import { Button } from "@repo/ui/button";
import { NavBar } from "./_components/NavBar";
import { Card } from "@repo/ui/card";
import Footer from "./_components/Footer";
import { Share2, Users2, Sparkles } from "lucide-react";
import Link from "next/link";



function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-blue-600  to-purple-600 text-white">
      {/* {<herosection />} */
      <NavBar />
      }
      {/* {<AuthPage} */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
              Collaborative Whiteboarding
              <span className=" text-color2/70 block">Made Simple</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground">
              Create, collaborate, and share beautiful diagrams and sketches with our intuitive drawing tool. 
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 ">
              <Link href={"/signin"}>
                <Button variant={"outline"} size="lg" className="h-12 px-6 bold rounded-lg bg-color2 text-black hover:brightness-90" >
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg" className="h-12 px-6 rounded-lg bg-color2 text-black hover:brightness-90">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-form-blue-400 justify-evenly ">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-color5">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* @ts-ignore */}
            <Card className="p-6 border-2 hover:border-color6 bg-color1 rounded-md transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl text-color9 font-semibold">Real-time Collaboration</h3>
              </div>
              <p className="mt-4 text-color7">
                Work together with your team in real-time. Share your drawings instantly with a simple link.
              </p>
            </Card>
          {/* @ts-ignore */}
            <Card className="p-6 border-2 hover:border-color6 bg-color1 rounded-md transition-colors ">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl text-color9 font-semibold">Multiplayer Editing</h3>
              </div>
              <p className="mt-4 text-color7">
                Multiple users can edit the same canvas simultaneously. See who's drawing what in real-time.
              </p>
            </Card>
            {/* @ts-ignore */}
            <Card className="p-6 border-2 hover:border-color6 bg-color1 rounded-md transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl text-color9 font-semibold">Smart Drawing</h3>
              </div>
              <p className="mt-4 text-color7">
                Intelligent shape recognition and drawing assistance helps you create perfect diagrams.  <br />
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-color1 rounded-3xl p-8 sm:p-16 ">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-color9 sm:text-4xl">
                Ready to start creating?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-slate-700">
                Join thousands of users who are already creating amazing diagrams and sketches.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" variant="outline" className="h-12 px-6 bg-color9 hover:bg-white hover:text-color5 rounded-md">
                  Open Canvas
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-6  bg-color9 hover:bg-white hover:text-color5 rounded-md">
                  View Gallery
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {<Footer/>}
      
    </div>
  );
}

export default App;