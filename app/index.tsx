import { useCallback, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import { networks } from "bitcoinjs-lib";
const network = networks.bitcoin;

import { ElectrumExplorer } from "@bitcoinerlab/explorer";
import {
  DiscoveryFactory,
  DiscoveryInstance,
  TxAttribution,
} from "@bitcoinerlab/discovery";
import { DescriptorsFactory } from "@bitcoinerlab/descriptors";
import * as secp256k1 from "@bitcoinerlab/secp256k1";
const { Output, expand } = DescriptorsFactory(secp256k1);

import { electrumParams } from "./utils";

export default function Home() {
  const [electrumURI, setElectrumURI] = useState<string>(
    "ssl://blockstream.info:700",
  );
  //corresponds to "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" pkh:
  const [descriptor, setDescriptor] = useState<string>(
    "pkh(xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39T9nMdj/1/*)",
  );
  const [discovery, setDiscovery] = useState<DiscoveryInstance | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);

  const connect = useCallback(async () => {
    if (electrumURI) {
      try {
        if (discovery) {
          await discovery.getExplorer().close();
        }
        setDiscovery(null);
        const params = electrumParams(electrumURI);
        const explorer = new ElectrumExplorer({ network, ...params });
        await explorer.connect();
        const { Discovery } = DiscoveryFactory(explorer, network);
        const newDiscovery = new Discovery();
        setDiscovery(newDiscovery);
      } catch (err) {
        setDiscovery(null);
      }
    }
  }, [electrumURI, discovery, network]);
  const disconnect = useCallback(async () => {
    if (discovery) {
      await discovery.getExplorer().close();
    }
    setDiscovery(null);
  }, [discovery]);

  const fetch = useCallback(async () => {
    if (discovery) {
      setFetching(true);
      await discovery.fetch({ descriptor });
      setFetching(false);
    }
  }, [discovery]);

  let isValidDescriptor = false;
  try {
    expand({ descriptor, network });
    isValidDescriptor = true;
  } catch (err) {
    console.log(err);
  }

  const isFetched =
    (isValidDescriptor && discovery?.whenFetched({ descriptor })) || false;
  const history = (
    isFetched ? discovery?.getHistory({ descriptor }, true) : []
  ) as TxAttribution[];
  const utxos = ((isFetched && discovery?.getUtxos({ descriptor })) ||
    []) as Array<string>;
  const balance = (isFetched && discovery?.getBalance({ descriptor })) || 0;

  return (
    <ScrollView>
      <View className="flex-1 justify-center items-center bg-gray-100 p-4">
        <Text className="mt-1">Enter your Electrum node URI:</Text>
        <TextInput
          value={electrumURI}
          onChangeText={setElectrumURI}
          className="border border-gray-300 p-2 rounded-lg w-full mt-1 bg-white"
          placeholder="e.g., ssl://electrum.example.com:50002"
        />
        {discovery ? (
          <Text className="mt-2 text-green-500">
            Connected to {electrumURI}
          </Text>
        ) : (
          <Text className="mt-2 text-red-500">Not connected</Text>
        )}
        {discovery ? (
          <Text
            className="py-2 px-4 rounded-lg overflow-hidden text-white bg-red-500 mt-4"
            onPress={disconnect}
          >
            Disconnect
          </Text>
        ) : (
          <Text
            className="py-2 px-4 rounded-lg overflow-hidden text-white bg-blue-500 mt-4"
            onPress={connect}
          >
            Connect
          </Text>
        )}
        <Text className="mt-8">Enter your Bitcoin descriptor:</Text>
        <TextInput
          value={descriptor}
          onChangeText={setDescriptor}
          className="border border-gray-300 p-2 rounded-lg w-full mt-1 bg-white"
          placeholder="e.g., wpkh([d34db33f/84h/0h/0h]xpub6.../0/*)"
        />
        {descriptor !== "" && !isValidDescriptor ? (
          <Text className="text-red-500 mt-2">
            This descriptor does not seem to be valid...
          </Text>
        ) : null}
        {fetching ? (
          <Text className={`"text-gray-400"} mt-4`}>Fetching...</Text>
        ) : (
          <Text
            className={`mt-4 py-2 px-4 rounded-lg overflow-hidden ${discovery && isValidDescriptor ? "text-white bg-blue-500" : "text-gray-400 bg-gray-200 opacity-50 cursor-not-allowed"}`}
            {...(discovery && isValidDescriptor ? { onPress: fetch } : {})}
          >
            Fetch
          </Text>
        )}
        <Text className="mt-8">{"Balance: " + balance}</Text>
        {utxos.length ? (
          <View className="gap-4 mt-8">
            {utxos.map((utxo) => (
              <Text
                key={utxo}
                className="rounded-lg overflow-hidden bg-white p-4 mb-4"
              >
                {utxo}
              </Text>
            ))}
          </View>
        ) : (
          <Text className="mt-8">No utxos found</Text>
        )}

        {history.length && discovery ? (
          <View className="gap-4 bg-gray-100 mt-8">
            <Text>
              {`History of transactions (${history.length}) and addresses of the descriptor:`}
            </Text>
            {[...history].reverse().map((txAttribution) => {
              const {
                ins,
                outs,
                netReceived,
                type,
                txId,
                irreversible,
                blockHeight,
              } = txAttribution;

              return (
                <View
                  key={txAttribution.txId}
                  className="rounded-lg overflow-hidden bg-white p-4 mb-4 gap-2"
                >
                  <Text
                    className={`${netReceived < 0 ? "text-red-500" : "text-green-500"}`}
                  >
                    {type}
                  </Text>
                  <Text>{`${netReceived} sats`}</Text>
                  <View className="flex-row">
                    <Text>txId: </Text>
                    <Text className="w-[80%] break-all" selectable={true}>
                      {txId}
                    </Text>
                  </View>
                  <Text selectable={true}>{`blockHeight: ${blockHeight}`}</Text>
                  <Text>{`irreversible: ${irreversible}`}</Text>

                  {/* Display sent sats */}
                  {ins.map((input, inputIndex) => {
                    if (input.ownedPrevTxo) {
                      const descriptorWithIndex = discovery.getDescriptor({
                        txo: input.ownedPrevTxo,
                      });
                      if (descriptorWithIndex) {
                        const { descriptor, index } = descriptorWithIndex;
                        const address = new Output({
                          descriptor,
                          index,
                          network,
                        }).getAddress();
                        return (
                          <Text
                            className="mt-2 break-words"
                            key={`input-${inputIndex}`}
                          >
                            {`Sent ${input.value} sats by placing them in tx's vin: ${inputIndex}, spending from descriptor index: ${index}, which corresponds to address: ${address}`}
                          </Text>
                        );
                      }
                    }
                    return null;
                  })}

                  {/* Display received sats */}
                  {outs.map((output, outputIndex) => {
                    if (output.ownedTxo) {
                      const descriptorWithIndex = discovery.getDescriptor({
                        txo: output.ownedTxo,
                      });
                      if (descriptorWithIndex) {
                        const { descriptor, index } = descriptorWithIndex;
                        const address = new Output({
                          descriptor,
                          index,
                          network,
                        }).getAddress();
                        return (
                          <Text
                            className="mt-2 break-words"
                            key={`output-${outputIndex}`}
                          >
                            {`Received ${output.value} sats from tx's vout: ${outputIndex}, to owned descriptor index: ${index}, which corresponds to address: ${address}`}
                          </Text>
                        );
                      }
                    }
                    return null;
                  })}
                </View>
              );
            })}
          </View>
        ) : (
          <Text className="gap-4 bg-gray-100 mt-8">No tx history found</Text>
        )}
      </View>
    </ScrollView>
  );
}
