
export default function NavHeader(){

    const menuPoints = ["Start", "Games", "Lobbys", "High-Scores", "Friends"];
    const menuPointsElements = menuPoints.map((name) => <MenuItem name={name}></MenuItem>)

    return (
        <> 
        
        <div className="flex flex-row justify-evenly container m-auto border-t-4 border-red-800">
            {menuPointsElements}
        </div>
    
        </>
    )


}

const MenuItem = ({name}) => {
    return(
        <div className="flex-grow-1 cursor-pointer hover:flex-grow-2 duration-150 ease-in-out">
            <div className="block relative w-full left-6 before:absolute before:top-0 before:right-0 before:left-0 before:bottom-0 before:-z-1 before:skew-x-45 before:bg-red-500 before:w-full before:shadow-2xl border-4 border-transparent">
                <p className="text-white text-center font-bold text-xl pt-2 pb-2">{name}</p>
            </div>
        </div>
    )
}

