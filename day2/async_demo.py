import asyncio


async def fetch_data():
    print("Start fetching data...")
    await asyncio.sleep(2)
    print("Data fetched")


async def main():
    await asyncio.gather(fetch_data(), fetch_data())


# Run the asyncio event loop
asyncio.run(main())