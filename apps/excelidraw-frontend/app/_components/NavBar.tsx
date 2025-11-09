import { Button } from "@repo/ui/button";
import Link from "next/link";
import { Dispatch, SetStateAction } from 'react'
import Image from "next/image";
export const NavBar = ()=>{

    return (
        <div className="flex justify-between items-center ">
            <div className="mt-2 brand flex gap-2 items-center ">
                <Image src="../logo.svg" alt="App Logo" width={260} height={260} />
                
            </div>
            <div className="flex gap-4 text-[0.75rem] md:text-[1rem] font-medium  text-white">
              <Link href={"/signin"}>
                <Button variant={"outline"} size="lg" className=" mt-2 h-10 px-6 bold rounded-lg  bg-color1 text-black hover:brightness-90" >
                  Sign in 
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg" className="h-10 mr-2 mt-2 px-6 rounded-lg  bg-color1 text-black hover:brightness-90">
                  Sign up
                </Button>
              </Link>
            </div>
        </div>
    );
};
