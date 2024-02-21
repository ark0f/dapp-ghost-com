use gclient::GearApi;
use gear_core::ids::ProgramId;

#[tokio::main]
async fn main() {
    let alice = GearApi::dev().await.unwrap().with("//Alice").unwrap();
    let bob = GearApi::dev().await.unwrap().with("//Bob").unwrap();

    let sender = true;
    if sender {
        let destination = bob.account_id();
        let destination = ProgramId::from(destination.as_ref());
        alice
            .send_message_bytes(destination, b"127.0.0.1", 0, 0)
            .await
            .unwrap();
    } else {
        let events = bob.events_since();
    }
}
