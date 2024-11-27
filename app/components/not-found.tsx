"use client"

const NotFound = () => {

    return (
        <div className="flex flex-col items-center justify-center w-screen h-screen">
            <div className="">
                <h1 className="text-center lg:text-3xl text-xl">Oops. Something went wrong!</h1>
                <p className="text-center lg:text-lg text-sm w-[90%] mx-auto">Try contacting the administartor at <b className="text-rose-800">paltaq.seu@gmail.com</b></p>
            </div>
        </div>
    );
}

export default NotFound;