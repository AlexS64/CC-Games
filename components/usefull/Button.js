import React from 'react';

export default function Button(props){
    return(
        {
            'def': <button 
                        className="py-2 px-4 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
                        onClick={() => props.callback()}
                    >
                    {props.children}
            </button>,

            'small': <button

            >
                {props.children}
            </button>,

            'header': <button 
                        className="py-1 px-2 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
                        onClick={() => props.callback()}
                    >
                    {props.children}
            </button>,



        } [props.type]
    

        
        
    )



}