import { MetaFunction } from '@remix-run/node'
import { json, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { TevmPlayground } from '@/components/TevmPlayground'

export const meta: MetaFunction = () => {
    return [
        { title: "Tevm Playground" },
        { name: "description", content: "Interactive playground for Tevm - Test, develop and deploy Ethereum smart contracts" },
    ]
}

export async function loader({ request }: LoaderFunctionArgs) {
    return json(request)
}

export default function Index() {
    const data = useLoaderData<typeof loader>()
    console.log('loaded index', data)
    return <TevmPlayground />
}

